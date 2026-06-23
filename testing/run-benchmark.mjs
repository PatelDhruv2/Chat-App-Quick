import { performance } from 'node:perf_hooks';

process.env.CHATAPP_BENCHMARK = '1';
process.env.JWT_SECRET_KEY ||= 'benchmark-secret-key';

const { setupSocket } = await import('../server/dist/socket.js');
const { default: AuthController } = await import('../server/dist/controllers/AuthController.js');

function createFakeResponse() {
  const state = {
    statusCode: 200,
    body: null,
  };

  return {
    status(code) {
      state.statusCode = code;
      return this;
    },
    json(payload) {
      state.body = payload;
      return payload;
    },
    get data() {
      return state;
    },
  };
}

function createFakeSocket(room) {
  const handlers = {};

  return {
    id: `socket-${Math.random().toString(16).slice(2)}`,
    handshake: {
      auth: { room },
      headers: { room },
    },
    handlers,
    joinedRooms: [],
    emitted: [],
    join(targetRoom) {
      this.joinedRooms.push(targetRoom);
    },
    on(event, handler) {
      handlers[event] = handler;
    },
    emit(event, payload) {
      this.emitted.push({ event, payload });
    },
  };
}

function createFakeIo() {
  const state = {
    connectionHandler: null,
    middleware: null,
    broadcasts: 0,
  };

  return {
    state,
    use(handler) {
      state.middleware = handler;
    },
    on(event, handler) {
      if (event === 'connection') {
        state.connectionHandler = handler;
      }
    },
    to() {
      return {
        emit: () => {
          state.broadcasts += 1;
        },
      };
    },
  };
}

async function benchmarkSocketPath(iterations = 2000) {
  const originalLog = console.log;
  const originalError = console.error;
  console.log = () => undefined;
  console.error = () => undefined;

  const fakeIo = createFakeIo();
  try {
    setupSocket(fakeIo);

    const socket = createFakeSocket('room-1');
    const maybeMiddleware = fakeIo.state.middleware;
    if (maybeMiddleware) {
      await new Promise((resolve, reject) => {
        maybeMiddleware(socket, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(undefined);
        });
      });
    }

    const connection = fakeIo.state.connectionHandler;
    if (!connection) {
      throw new Error('Socket connection handler was not registered');
    }

    await connection(socket);
    const messageHandler = socket.handlers.message;
    if (!messageHandler) {
      throw new Error('Socket message handler was not registered');
    }

    const payload = {
      group_id: 'room-1',
      name: 'Benchmark User',
      message: 'hello from benchmark',
    };

    const start = performance.now();
    for (let index = 0; index < iterations; index += 1) {
      await messageHandler(payload);
    }
    const elapsedMs = performance.now() - start;

    return {
      iterations,
      elapsedMs,
      averageMs: elapsedMs / iterations,
      throughputPerSecond: (iterations / elapsedMs) * 1000,
    };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

async function benchmarkLoginPath(iterations = 2000) {
  const originalLog = console.log;
  const originalError = console.error;
  console.log = () => undefined;
  console.error = () => undefined;

  try {
    const request = {
      body: {
        name: 'Benchmark User',
        email: 'benchmark@example.com',
        provider: 'google',
        oauth_id: 'benchmark-oauth-id',
        image: null,
      },
    };

    const firstResponse = createFakeResponse();
    const firstStart = performance.now();
    await AuthController.getUser(request, firstResponse);
    const firstElapsedMs = performance.now() - firstStart;

    const repeatedStart = performance.now();
    for (let index = 0; index < iterations; index += 1) {
      const response = createFakeResponse();
      await AuthController.getUser(request, response);
    }
    const repeatedElapsedMs = performance.now() - repeatedStart;

    return {
      firstCallMs: firstElapsedMs,
      repeatedIterations: iterations,
      repeatedElapsedMs,
      repeatedAverageMs: repeatedElapsedMs / iterations,
      repeatedThroughputPerSecond: (iterations / repeatedElapsedMs) * 1000,
    };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

const socketResults = await benchmarkSocketPath();
const loginResults = await benchmarkLoginPath();

console.log(
  JSON.stringify(
    {
      mode: 'benchmark',
      socketResults,
      loginResults,
    },
    null,
    2,
  ),
);
