import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ConsentForm({ onNext }: { onNext: () => void }) {
  const [isAgreed, setIsAgreed] = useState(false);

  const handleContinue = () => {
    if (isAgreed) {
      onNext();
    } else {
      alert("You must agree to the terms to proceed.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Consent Form</h2>
      <p>Please read and accept the following terms before proceeding with the medical assessment.</p>
      <h3 className="font-semibold">Terms of Assessment</h3>
      <ul className="list-disc pl-5">
        <li>By proceeding with this virtual medical examination, you acknowledge and agree to the following:</li>
        <li>The assessment will be conducted through AI-powered technology.</li>
        <li>Your responses will be recorded and analyzed securely.</li>
        <li>The results will be shared with relevant insurance providers.</li>
        <li>You can request access to your data at any time.</li>
      </ul>
      <h3 className="font-semibold">Data Privacy</h3>
      <ul className="list-disc pl-5">
        <li>Your privacy is important to us. All data collected during this assessment is:</li>
        <li>Encrypted and stored securely.</li>
        <li>Handled in compliance with HIPAA regulations.</li>
        <li>Never shared without your explicit consent.</li>
        <li>Retained only for the necessary duration.</li>
      </ul>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="consent"
          checked={isAgreed}
          onChange={(e) => setIsAgreed(e.target.checked)}
          required
        />
        <label htmlFor="consent" className="ml-2">
          I have read and agree to the terms of assessment and data privacy policy.
        </label>
      </div>
      <Button onClick={handleContinue} className="w-full">
        Continue
      </Button>
    </div>
  );
}