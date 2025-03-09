class Env{

    static APP_URL:string=process.env.NEXTAUTH_URL || 'http://localhost:3000';
    static BACKEND_URL:string=process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';
}
export default Env;