"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { FileText, Download, Share2, Calendar } from "lucide-react";
import Link from "next/link";

const reports = [
  {
    id: "1",
    date: "2024-02-20",
    type: "Cardiovascular Health",
    status: "completed",
    score: 92,
  },
  {
    id: "2",
    date: "2024-02-15",
    type: "Neurological Screening",
    status: "completed",
    score: 88,
  },
];

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Medical Reports</h1>
            <p className="text-muted-foreground">
              View and manage your assessment reports
            </p>
          </div>
          <Button asChild>
            <Link href="/assessment/select">New Assessment</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {reports.map((report) => (
            <FadeIn key={report.id}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-semibold">
                    {report.type}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Health Score:</span>
                        <span className="text-green-600">{report.score}%</span>
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/reports/${report.id}`}>
                        View Full Report
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
} 