"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ChatGroupType } from "../../../type";

export default function ChatUserDialog({
  open,
  setOpen,
  group,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  group: ChatGroupType;
}) {
  const params = useParams();
  const [state, setState] = useState({
    name: "",
    passcode: "",
  });

  useEffect(() => {
    const storedData = localStorage.getItem(params["id"] as string);
    if (storedData) {
      const jsonData = JSON.parse(storedData);
      if (jsonData?.name && jsonData?.group_id) {
        setOpen(false);
      }
    }
  }, [params, setOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check if passcode is correct before making a request
    if (group.passcode !== state.passcode) {
      toast.error("Please enter the correct passcode!");
      return;
    }

    const existingUser = localStorage.getItem(params["id"] as string);
    if (!existingUser) {
      try {
        const response = await fetch("http://localhost:7000/api/chat-group-users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: state.name,
            group_id: params["id"] as string,
          }),
        });
        console.log("Response status:", response);
        if (!response.ok) {
            toast.error("Failed to join the chat group. Please try again!");
            return;
        }

        const result = await response.json();
        localStorage.setItem(params["id"] as string, JSON.stringify(result.data));
        toast.success("Successfully joined the chat group!");
        setOpen(false);
      } catch (error) {
        console.error("Error adding user:", error);
        toast.error("Something went wrong. Please try again!");
      }
    } else {
      toast.info("You are already a member of this group.");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Name and Passcode</DialogTitle>
          <DialogDescription>
            Add your name and passcode to join the room.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mt-2">
            <Input
              placeholder="Enter your name"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              required
            />
          </div>
          <div className="mt-2">
            <Input
              placeholder="Enter your passcode"
              value={state.passcode}
              onChange={(e) => setState({ ...state, passcode: e.target.value })}
              required
            />
          </div>
          <div className="mt-2">
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
