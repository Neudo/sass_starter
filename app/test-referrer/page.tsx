"use client";

import { useState } from "react";
import { normalizeReferrer, getChannel } from "@/lib/referrer-helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function TestReferrerPage() {
  const [testInput, setTestInput] = useState("");
  const [isRefParam, setIsRefParam] = useState(false);
  
  // Test cases prédéfinis
  const testCases = [
    { input: "t.co", isRef: false, expected: "X (Twitter)" },
    { input: "news.ycombinator.com", isRef: false, expected: "Hacker News" },
    { input: "producthunt", isRef: true, expected: "Product Hunt" },
    { input: "google.com", isRef: false, expected: "Google" },
    { input: "www.google.com", isRef: false, expected: "Google" },
    { input: "l.facebook.com", isRef: false, expected: "Facebook" },
    { input: "mail.google.com", isRef: false, expected: "Gmail" },
    { input: "reddit.com", isRef: false, expected: "Reddit" },
    { input: "hackernews", isRef: true, expected: "Hacker News" },
    { input: "unknown-site.com", isRef: false, expected: "Unknown-site" },
    { input: "", isRef: false, expected: "Direct" },
    { input: null, isRef: false, expected: "Direct" },
  ];

  // Test cases pour les channels
  const channelTests = [
    { utm_medium: "cpc", utm_source: "google", referrer: null, expected: "Paid Search" },
    { utm_medium: "social", utm_source: "facebook", referrer: null, expected: "Paid Social" },
    { utm_medium: "email", utm_source: "newsletter", referrer: null, expected: "Email" },
    { utm_medium: "organic", utm_source: "google", referrer: null, expected: "Organic Search" },
    { utm_medium: null, utm_source: "twitter", referrer: null, expected: "Organic Social" },
    { utm_medium: null, utm_source: null, referrer: "https://google.com/search", expected: "Organic Search" },
    { utm_medium: null, utm_source: null, referrer: "https://t.co/123", expected: "Organic Social" },
    { utm_medium: null, utm_source: null, referrer: "https://news.ycombinator.com/", expected: "Referral" },
    { utm_medium: null, utm_source: null, referrer: null, expected: "Direct" },
  ];

  // Simuler différentes URLs avec paramètres
  const simulateUrls = [
    {
      title: "ProductHunt Launch",
      url: "https://localhost:3000/?ref=producthunt",
      expectedSource: "producthunt",
      expectedChannel: "Referral",
    },
    {
      title: "Paid Search Campaign", 
      url: "https://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=launch",
      expectedSource: "google",
      expectedChannel: "Paid Search",
    },
    {
      title: "Social Media Campaign", 
      url: "https://localhost:3000/?utm_source=facebook&utm_medium=social&utm_campaign=awareness",
      expectedSource: "facebook",
      expectedChannel: "Paid Social",
    },
    {
      title: "Direct + Referrer from HN",
      url: "https://localhost:3000/",
      referrer: "https://news.ycombinator.com/item?id=12345",
      expectedSource: "hackernews",
      expectedChannel: "Referral",
    },
    {
      title: "Google Organic Search",
      url: "https://localhost:3000/",
      referrer: "https://www.google.com/search?q=analytics",
      expectedSource: "google",
      expectedChannel: "Organic Search",
    },
    {
      title: "Email Newsletter",
      url: "https://localhost:3000/?utm_source=newsletter&utm_medium=email&utm_campaign=weekly",
      expectedSource: "newsletter",
      expectedChannel: "Email",
    },
  ];

  const testSingleInput = (input: string | null, isRef: boolean) => {
    const result = normalizeReferrer(input, isRef);
    return result;
  };

  const simulateTracking = (url: string, referrer?: string) => {
    // Parse URL params
    const urlObj = new URL(url);
    const ref = urlObj.searchParams.get("ref");
    const utm_source = urlObj.searchParams.get("utm_source");
    const utm_medium = urlObj.searchParams.get("utm_medium");
    
    // Parse referrer domain
    let referrer_domain = null;
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        referrer_domain = referrerUrl.hostname;
      } catch (e) {
        console.error("Invalid referrer URL:", e);
      }
    }
    
    // Apply the same logic as the API
    const source = utm_source || ref || referrer_domain || "direct";
    const isRefParameter = !!(utm_source || ref);
    const sourceResult = normalizeReferrer(source, isRefParameter);
    
    // Get channel
    const channel = getChannel(utm_medium, utm_source || ref || null, referrer_domain);
    
    return { source: sourceResult, channel };
  };

  const testChannel = (utm_medium: string | null, utm_source: string | null, referrer: string | null) => {
    let referrer_domain = null;
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        referrer_domain = referrerUrl.hostname;
      } catch (e) {
        console.error("Invalid referrer URL:", e);
      }
    }
    return getChannel(utm_medium, utm_source, referrer_domain);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Referrer Helper Test Page</h1>
      
      {/* Test manuel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Manuel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Entrez un domaine ou ref param (ex: t.co, producthunt)"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1"
            />
            <Button
              variant={isRefParam ? "default" : "outline"}
              onClick={() => setIsRefParam(!isRefParam)}
            >
              {isRefParam ? "Ref Param" : "Domain"}
            </Button>
          </div>
          
          {testInput && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Résultat:</p>
              {(() => {
                const result = testSingleInput(testInput, isRefParam);
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Display Name:</span>
                      <span>{result.displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Internal Name:</span>
                      <span className="font-mono text-sm">{result.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Category:</span>
                      <Badge variant="outline">{result.category}</Badge>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tests automatiques */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tests Automatiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testCases.map((test, index) => {
              const result = testSingleInput(test.input, test.isRef);
              const isCorrect = result.displayName === test.expected;
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {test.input || "(empty)"}
                      </span>
                      {test.isRef && <Badge variant="secondary">ref</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                        {result.displayName}
                      </span>
                      {!isCorrect && (
                        <span className="text-sm text-muted-foreground">
                          (expected: {test.expected})
                        </span>
                      )}
                      <span className="text-xl">{isCorrect ? "✅" : "❌"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tests des Channels */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tests des Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {channelTests.map((test, index) => {
              const result = testChannel(test.utm_medium, test.utm_source, test.referrer);
              const isCorrect = result === test.expected;
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span>
                        medium: <code>{test.utm_medium || "null"}</code>
                      </span>
                      <span>
                        source: <code>{test.utm_source || "null"}</code>
                      </span>
                      {test.referrer && <span>referrer: <code className="text-xs">{test.referrer}</code></span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                        {result}
                      </span>
                      {!isCorrect && (
                        <span className="text-sm text-muted-foreground">
                          (expected: {test.expected})
                        </span>
                      )}
                      <span className="text-xl">{isCorrect ? "✅" : "❌"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Simulation d'URLs complètes */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation de Tracking Complet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {simulateUrls.map((sim, index) => {
              const result = simulateTracking(sim.url, sim.referrer);
              const sourceCorrect = result.source.name === sim.expectedSource;
              const channelCorrect = result.channel === sim.expectedChannel;
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    sourceCorrect && channelCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <h3 className="font-semibold mb-2">{sim.title}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="font-mono bg-white p-2 rounded border">
                      URL: {sim.url}
                    </div>
                    {sim.referrer && (
                      <div className="font-mono bg-white p-2 rounded border">
                        Referrer: {sim.referrer}
                      </div>
                    )}
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span>
                            <strong>Source:</strong> {result.source.displayName}
                          </span>
                          <Badge variant="outline">{result.source.category}</Badge>
                        </div>
                        <span className="text-xl">{sourceCorrect ? "✅" : "❌"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>
                          <strong>Channel:</strong> {result.channel}
                        </span>
                        <span className="text-xl">{channelCorrect ? "✅" : "❌"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instructions pour tester */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Comment tester en local</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Simuler ProductHunt:</h3>
            <code className="block p-2 bg-muted rounded">
              http://localhost:3000/?ref=producthunt
            </code>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">2. Simuler une campagne Twitter:</h3>
            <code className="block p-2 bg-muted rounded">
              http://localhost:3000/?utm_source=twitter&utm_medium=social
            </code>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">3. Simuler un referrer (dans la console):</h3>
            <pre className="p-2 bg-muted rounded text-sm">
{`// Ouvrir la console et exécuter:
Object.defineProperty(document, 'referrer', {
  value: 'https://news.ycombinator.com/',
  writable: false
});`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Vérifier dans Supabase:</h3>
            <p className="text-sm text-muted-foreground">
              Après avoir visité le site avec ces paramètres, vérifiez la table sessions
              dans Supabase pour voir les valeurs utm_source et referrer_domain stockées.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}