import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PreAssessmentProps {
  onBack: () => void;
  onNext: (data: { height: string; weight: string; smoker: string; exerciseFrequency: string }) => void;
}

export function PreAssessment({ onBack, onNext }: PreAssessmentProps) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [smoker, setSmoker] = useState("no");
  const [exerciseFrequency, setExerciseFrequency] = useState("");

  const handleContinue = () => {
    if (!height || !weight || !exerciseFrequency) {
      alert("Please fill in all required fields.");
      return;
    }
    // Proceed to the next step with the collected data
    onNext({ height, weight, smoker, exerciseFrequency });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Pre-Assessment Questionnaire</h2>
        <p className="text-muted-foreground">
          Please provide accurate information to help us conduct a thorough assessment.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="height">Height (cm) <span className="text-red-500">*</span></Label>
          <Input
            id="height"
            type="number"
            placeholder="Enter your height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="weight">Weight (kg) <span className="text-red-500">*</span></Label>
          <Input
            id="weight"
            type="number"
            placeholder="Enter your weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label>Do you smoke? <span className="text-red-500">*</span></Label>
          <RadioGroup value={smoker} onValueChange={setSmoker}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="smoke-yes" />
              <Label htmlFor="smoke-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="smoke-no" />
              <Label htmlFor="smoke-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="exercise">Exercise Frequency <span className="text-red-500">*</span></Label>
          <Select value={exerciseFrequency} onValueChange={setExerciseFrequency}>
            <SelectTrigger id="exercise">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">2-3 times a week</SelectItem>
              <SelectItem value="occasional">Occasionally</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
} 