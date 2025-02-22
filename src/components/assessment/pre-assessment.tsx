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
  onNext: () => void;
}

export function PreAssessment({ onBack, onNext }: PreAssessmentProps) {
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
          <Label htmlFor="height">Height (cm)</Label>
          <Input id="height" type="number" placeholder="Enter your height" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input id="weight" type="number" placeholder="Enter your weight" />
        </div>

        <div className="grid gap-2">
          <Label>Do you smoke?</Label>
          <RadioGroup defaultValue="no">
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
          <Label htmlFor="exercise">Exercise Frequency</Label>
          <Select>
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
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
} 