"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface FormButtonProps {
  size: number;
  remove: () => void;
  add: () => void;
}

const FormButton: React.FC<FormButtonProps> = ({ size, remove, add }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <Button type="button" onClick={add} aria-label="Add">
        <Plus className="h-4 w-4" />
      </Button>
      {size > 0 && (
        <Button
          type="button"
          variant="destructive"
          onClick={remove}
          aria-label="Remove"
        >
          <Minus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default FormButton;

