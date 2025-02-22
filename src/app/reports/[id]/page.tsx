"use client";

import { MedicalReport } from "@/components/assessment/report-generator";
import { RiskScoring } from "@/components/assessment/risk-scoring";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Mock data - in real app, fetch based on report ID
const reportData = {
  patientInfo: {
    name: "John Doe",
    date: "2024-02-20",
    assessmentType: "Cardiovascular Health",
  },
  sections: [
    {
      title: "Cardiovascular Health",
      content: "Blood pressure and heart rate are within normal ranges...",
    },
    {
      title: "Risk Factors",
      content: "No significant cardiovascular risk factors identified...",
    },
  ],
  recommendations: [
    "Maintain regular exercise routine",
    "Continue heart-healthy diet",
    "Follow up with primary care physician in 6 months",
  ],
};

const riskFactors = [
  {
    category: "Blood Pressure",
    level: "low",
    score: 95,
    description: "Within optimal range",
  },
  {
    category: "Heart Rate",
    level: "low",
    score: 90,
    description: "Normal resting heart rate",
  },
];

export default function ReportPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Assessment Report</h1>
        </div>

        <div className="grid gap-8">
          <FadeIn>
            <MedicalReport
              patientInfo={reportData.patientInfo}
              sections={reportData.sections}
              recommendations={reportData.recommendations}
              onDownload={() => console.log("Downloading...")}
              onShare={() => console.log("Sharing...")}
            />
          </FadeIn>

          <FadeIn delay={0.2}>
            <RiskScoring
              overallScore={92}
              riskFactors={riskFactors}
            />
          </FadeIn>
        </div>
      </div>
    </div>
  );
} 