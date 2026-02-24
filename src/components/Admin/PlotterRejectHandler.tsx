
import React, { useState, useImperativeHandle, forwardRef } from "react";
import RejectReasonModal from "../ui/RejectReasonModal";

export interface PlotterRejectHandlerProps {
  onSubmit: (orderId: number, newStatus: string, reason: string) => void;
}

export interface PlotterRejectHandlerRef {
  requestReject: (orderId: number, newStatus: string) => void;
}

const PlotterRejectHandler = forwardRef<PlotterRejectHandlerRef, PlotterRejectHandlerProps>(
  ({ onSubmit }, ref) => {
    const [open, setOpen] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
    const [pendingStatus, setPendingStatus] = useState<string>("");

    useImperativeHandle(ref, () => ({
      requestReject: (orderId: number, newStatus: string) => {
        setPendingOrderId(orderId);
        setPendingStatus(newStatus);
        setOpen(true);
      }
    }));

    const handleModalSubmit = (reason: string) => {
      if (pendingOrderId && pendingStatus) {
        onSubmit(pendingOrderId, pendingStatus, reason);
      }
      setOpen(false);
      setPendingOrderId(null);
      setPendingStatus("");
    };

    return (
      <RejectReasonModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleModalSubmit}
      />
    );
  }
);

export default PlotterRejectHandler;
