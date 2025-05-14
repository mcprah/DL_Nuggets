import { useState, useEffect, useMemo } from "react";
import { Card, Skeleton, Divider } from "@nextui-org/react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CaseAnalysis,
  CaseDataForAnalysis,
  analyzeCaseWithAI,
  getCaseAnalysisByCitation,
  createCaseAnalysis,
} from "~/api/case-analysis";
import { convertAnalysisToMarkdown } from "~/utils/helpers";

interface CaseAnalysisDisplayProps {
  caseData: Record<string, any>;
  baseUrl: string;
  baseAIUrl: string;
  initialAnalysis?: CaseAnalysis | null; // New prop to receive analysis directly
  onAnalysisGenerated?: (analysis: CaseAnalysis) => void;
}

const components: Partial<Components> = {
  pre: ({ children }) => <>{children}</>,
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      <a
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
};

export default function CaseAnalysisDisplay({
  caseData,
  baseUrl,
  baseAIUrl,
  initialAnalysis,
  onAnalysisGenerated,
}: CaseAnalysisDisplayProps) {
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(
    initialAnalysis || null
  );
  const [loading, setLoading] = useState<boolean>(!initialAnalysis);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If initialAnalysis is provided, use it and skip the fetch/generate process
    if (initialAnalysis) {
      setAnalysis(initialAnalysis);
      if (onAnalysisGenerated) {
        onAnalysisGenerated(initialAnalysis);
      }
      return;
    }

    const fetchOrGenerateAnalysis = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        // First, check if analysis already exists in the database
        const existingAnalysis = await getCaseAnalysisByCitation(
          baseUrl,
          caseData.dl_citation_no,
          token
        );
        console.log(existingAnalysis.success);

        if (existingAnalysis.success) {
          setAnalysis(existingAnalysis.data);
          if (onAnalysisGenerated) {
            onAnalysisGenerated(existingAnalysis.data);
          }
          setLoading(false);
          return;
        }

        // Generate new analysis with AI - directly use analyzeCaseWithAI without vectorStoreId
        const analysisResponse = await analyzeCaseWithAI(
          baseAIUrl,
          caseData,
          undefined,
          token
        );

        if (analysisResponse.success && analysisResponse.data) {
          const analysisMarkdown = convertAnalysisToMarkdown(
            analysisResponse.data
          );

          const newAnalysis: CaseAnalysis = {
            ...analysisResponse.data,
            analysis: analysisMarkdown ?? "",
            created_at: new Date().toISOString(),
            dl_citation_no: caseData.dl_citation_no,
            vector_store_id: analysisResponse.data.vector_store_id,
            vector_file_id: analysisResponse.data.file_id,
          };
          setAnalysis(newAnalysis);

          // Save the analysis to the database
          await createCaseAnalysis(
            baseUrl,
            {
              ...analysisResponse.data,
              analysis: analysisMarkdown ?? "",
              created_at: new Date().toISOString(),
              dl_citation_no: caseData.dl_citation_no,
              vector_store_id: analysisResponse.data.vector_store_id,
              vector_file_id: analysisResponse.data.file_id,
            },
            token
          );

          if (onAnalysisGenerated) {
            onAnalysisGenerated(newAnalysis);
          }
        } else {
          setError("Failed to generate analysis");
        }
      } catch (err) {
        console.error("Error in case analysis process:", err);
        setError("Failed to generate or retrieve case analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateAnalysis();
  }, [
    caseData.dl_citation_no,
    baseUrl,
    baseAIUrl,
    initialAnalysis,
    onAnalysisGenerated,
  ]);

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <p className="font-medium text-red-700">Error</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* AI Generated Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 flex items-center gap-3 rounded-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <div>
          <p className="font-medium text-blue-700">
            {loading ? "Generating Analysis..." : "AI-Generated Analysis"}
          </p>
          <p className="text-sm text-blue-600">
            {loading
              ? "This case analysis is being generated using AI..."
              : "This case analysis was automatically generated using AI and may not be comprehensive or entirely accurate."}
          </p>
        </div>
      </div>

      {loading ? <LoadingSkeletons /> : <AnalysisContent analysis={analysis} />}
    </div>
  );
}

function LoadingSkeletons() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Case Analysis</h3>
        <div className="space-y-2">
          <Skeleton className="w-full h-4 rounded-lg" />
          <Skeleton className="w-full h-4 rounded-lg" />
          <Skeleton className="w-4/5 h-4 rounded-lg" />
        </div>
      </div>

      <Divider className="my-4" />

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Key Points</h3>
        <ul className="list-disc pl-5 space-y-3">
          <li className="flex items-center">
            <Skeleton className="w-full h-4 rounded-lg" />
          </li>
          <li className="flex items-center">
            <Skeleton className="w-full h-4 rounded-lg" />
          </li>
          <li className="flex items-center">
            <Skeleton className="w-5/6 h-4 rounded-lg" />
          </li>
        </ul>
      </div>
    </div>
  );
}

function AnalysisContent({ analysis }: { analysis: CaseAnalysis | null }) {
  if (!analysis) return null;

  // Memoize the markdown content extraction
  const markdownContent = useMemo(() => {
    if (typeof analysis === "string") {
      return analysis;
    }

    if (typeof analysis.analysis === "string") {
      return analysis.analysis;
    }

    if (analysis.analysis && typeof analysis.analysis === "object") {
      try {
        return JSON.stringify(analysis.analysis, null, 2);
      } catch (e) {
        return "Error parsing analysis content";
      }
    }

    return "";
  }, [analysis]); // Only re-compute when analysis changes

  return (
    <Card
      shadow="none"
      className="border border-gray-100 overflow-visible bg-white"
    >
      <div className="p-5">
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {markdownContent}
          </ReactMarkdown>
        </div>

        <Divider className="my-6" />

        <div className="text-xs text-gray-500 text-right">
          Generated:{" "}
          {new Date(analysis.created_at || Date.now()).toLocaleString()}
        </div>
      </div>
    </Card>
  );
}
