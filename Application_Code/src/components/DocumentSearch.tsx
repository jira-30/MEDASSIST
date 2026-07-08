import { useState } from "react";
import { Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  documentId: string;
  filename: string;
  snippet: string;
  relevance: number;
}

const DocumentSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = (value: string) => {
    setQuery(value);
    // TODO: Implement actual search across documents
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Search Across Documents</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search medical records, symptoms, medications..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        <div className="space-y-2">
          {results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No search results</p>
              <p className="text-xs">Try searching for symptoms, medications, or conditions</p>
            </div>
          ) : (
            results.map((result, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm">{result.filename}</p>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(result.relevance * 100)}% match
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {result.snippet}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentSearch;
