import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ConsentFormProps {
  onNext: () => void;
}

export function ConsentForm({ onNext }: ConsentFormProps) {
  const [consented, setConsented] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Consent Form</h2>
        <p className="text-muted-foreground mb-6">
          Please read and accept the following terms before proceeding with the medical assessment.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h3>Terms of Assessment</h3>
        <p>
          By proceeding with this virtual medical examination, you acknowledge and agree to the following:
        </p>
        <ul>
          <li>The assessment will be conducted through AI-powered technology</li>
          <li>Your responses will be recorded and analyzed securely</li>
          <li>The results will be shared with relevant insurance providers</li>
          <li>You can request access to your data at any time</li>
        </ul>

        <h3>Data Privacy</h3>
        <p>
          Your privacy is important to us. All data collected during this assessment is:
        </p>
        <ul>
          <li>Encrypted and stored securely</li>
          <li>Handled in compliance with HIPAA regulations</li>
          <li>Never shared without your explicit consent</li>
          <li>Retained only for the necessary duration</li>
        </ul>
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <Checkbox 
          id="consent" 
          checked={consented}
          onCheckedChange={(checked) => setConsented(checked as boolean)}
        />
        <label
          htmlFor="consent"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I have read and agree to the terms of assessment and data privacy policy
        </label>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={onNext} disabled={!consented}>
          Continue
        </Button>
      </div>
    </div>
  );
} 