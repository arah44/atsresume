"use client";
import React, { } from "react";
import { Button } from "./ui/button";
import { Fullscreen, PanelLeftOpen } from "lucide-react";
import { SheetOverlay } from "./ui/sheet";

const FormCloseOpenBtn = ({ formClose, setFormClose }) => {
  return (
    <Button
      aria-label="Form Open/Close"
      variant="outline"
      className="hidden bottom-5 left-10 order-2 font-bold border-white shadow-lg md:fixed b exclude-print"
      onClick={() => setFormClose(!formClose)}
    >
      {formClose ? <PanelLeftOpen className="w-10 h-10" title="Form Open" /> : <Fullscreen className="w-10 h-10" title="Form Close" />}
    </Button>
  )
}

export default FormCloseOpenBtn;
