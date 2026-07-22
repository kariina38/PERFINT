import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { ShieldCheck } from "lucide-react";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  email: string;
}

export function OtpModal({ isOpen, onClose, onVerify, email }: OtpModalProps) {
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <DialogTitle className="text-center">OTP Verification</DialogTitle>
          <DialogDescription className="text-center">
            We've sent a 6-digit code to
            <br />
            <span className="font-medium text-gray-900">{email || "your email/phone"}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Verify OTP
          </Button>

          <button className="text-sm text-blue-600 hover:underline">
            Resend OTP
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
