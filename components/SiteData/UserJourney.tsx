"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import {
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Chrome,
  ExternalLink,
  UserCheck,
  UserX
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface Session {
  id: string;
  created_at: string;
  last_seen: string;
  country: string;
  city: string;
  region: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  screen_size: string;
  referrer: string;
  referrer_domain: string;
  channel: string;
  language: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

interface PageView {
  id: string;
  page_path: string;
  page_title: string;
  created_at: string;
  duration_seconds: number;
  entry_page: boolean;
  exit_page: boolean;
}

interface CustomEvent {
  id: string;
  name: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

interface UserJourneyProps {
  siteId: string;
  dateRange: { from: Date; to: Date } | null;
  isRealtimeMode: boolean;
}

export function UserJourney({ siteId, dateRange, isRealtimeMode }: UserJourneyProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const supabase = createClient();

  // Fetch sessions data
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("sessions")
          .select("*")
          .eq("site_id", siteId)
          .order("last_seen", { ascending: false })
          .limit(50);

        // Apply date range filter if not in realtime mode
        if (!isRealtimeMode && dateRange) {
          query = query
            .gte("created_at", dateRange.from.toISOString())
            .lte("created_at", dateRange.to.toISOString());
        } else if (isRealtimeMode) {
          // Show last 30 minutes for realtime mode
          const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
          query = query.gte("last_seen", thirtyMinutesAgo.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();

    // Set up realtime subscription if in realtime mode
    if (isRealtimeMode) {
      const channel = supabase
        .channel("sessions-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sessions",
            filter: `site_id=eq.${siteId}`,
          },
          () => {
            fetchSessions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [siteId, dateRange, isRealtimeMode, supabase]);

  // Fetch session details (page views and custom events)
  const fetchSessionDetails = async (sessionId: string) => {
    setDetailsLoading(true);
    try {
      // Fetch page views
      const { data: pageViewsData, error: pageViewsError } = await supabase
        .from("page_views")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (pageViewsError) throw pageViewsError;
      setPageViews(pageViewsData || []);

      // Fetch custom events
      const { data: customEventsData, error: customEventsError } = await supabase
        .from("custom_event_completions")
        .select(`
          id,
          created_at,
          metadata,
          custom_events!inner(name)
        `)
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (customEventsError) throw customEventsError;

      const formattedEvents = customEventsData?.map(event => ({
        id: event.id,
        name: event.custom_events?.name || "Unknown",
        created_at: event.created_at,
        metadata: event.metadata
      })) || [];

      setCustomEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching session details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSessionClick = async (session: Session) => {
    setSelectedSession(session);
    setIsSheetOpen(true);
    await fetchSessionDetails(session.id);
  };

  const getDeviceIcon = (screenSize: string) => {
    if (screenSize?.includes("mobile")) return <Smartphone className="h-4 w-4" />;
    if (screenSize?.includes("tablet")) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getBrowserIcon = () => {
    // For simplicity, using Chrome icon for all browsers
    // You can expand this with more browser icons
    return <Chrome className="h-4 w-4" />;
  };

  const getOSIcon = () => {
    // Using Globe as a generic OS icon
    return <Globe className="h-4 w-4" />;
  };

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode === "Unknown") return "🌍";

    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const isFirstVisit = (session: Session) => {
    const createdAt = new Date(session.created_at);
    const lastSeen = new Date(session.last_seen);
    const diffInMinutes = (lastSeen.getTime() - createdAt.getTime()) / (1000 * 60);

    // Consider it a first visit if created_at and last_seen are within 30 minutes
    return diffInMinutes < 30;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <TooltipProvider>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Visitor</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Device & System</TableHead>
                <TableHead>First Visit</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No visitors found for the selected period
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSessionClick(session)}
                  >
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-lg">
                            {getFlagEmoji(session.country)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{session.country || "Unknown"}</p>
                          {session.city && <p className="text-xs">{session.city}, {session.region}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {session.channel || "Direct"}
                        </Badge>
                        {session.referrer_domain && (
                          <p className="text-xs text-muted-foreground">{session.referrer_domain}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Tooltip>
                          <TooltipTrigger>
                            {getDeviceIcon(session.screen_size)}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{session.screen_size || "Unknown"}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            {getOSIcon()}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{session.os} {session.os_version}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            {getBrowserIcon()}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{session.browser} {session.browser_version}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isFirstVisit(session) ? (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <UserX className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(session.last_seen), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSessionClick(session);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>

      {/* Session Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Visitor Journey Details</SheetTitle>
          </SheetHeader>

          {selectedSession && (
            <div className="mt-6 space-y-6">
              {/* Visitor Information */}
              <div>
                <h3 className="font-medium mb-3">Visitor Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>
                      {getFlagEmoji(selectedSession.country)} {selectedSession.country}
                      {selectedSession.city && `, ${selectedSession.city}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span>{selectedSession.language || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device:</span>
                    <span>{selectedSession.screen_size || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OS:</span>
                    <span>{selectedSession.os} {selectedSession.os_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Browser:</span>
                    <span>{selectedSession.browser} {selectedSession.browser_version}</span>
                  </div>
                </div>
              </div>

              {/* Source Information */}
              <div>
                <h3 className="font-medium mb-3">Source Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Channel:</span>
                    <Badge variant="outline">{selectedSession.channel || "Direct"}</Badge>
                  </div>
                  {selectedSession.referrer && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Referrer:</span>
                      <span className="text-xs truncate max-w-[300px]">{selectedSession.referrer}</span>
                    </div>
                  )}
                  {selectedSession.utm_source && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">UTM Source:</span>
                        <span>{selectedSession.utm_source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">UTM Medium:</span>
                        <span>{selectedSession.utm_medium}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">UTM Campaign:</span>
                        <span>{selectedSession.utm_campaign}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Page Views */}
              <div>
                <h3 className="font-medium mb-3">Page Views ({pageViews.length})</h3>
                {detailsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : pageViews.length > 0 ? (
                  <div className="space-y-2">
                    {pageViews.map((view) => (
                      <div key={view.id} className="p-3 border rounded-md">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <p className="font-medium text-sm">{view.page_title || "Untitled"}</p>
                            <p className="text-xs text-muted-foreground">{view.page_path}</p>
                            <div className="flex gap-2 mt-1">
                              {view.entry_page && (
                                <Badge variant="secondary" className="text-xs">Entry</Badge>
                              )}
                              {view.exit_page && (
                                <Badge variant="secondary" className="text-xs">Exit</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(view.duration_seconds || 0)}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(view.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No page views recorded</p>
                )}
              </div>

              {/* Custom Events */}
              <div>
                <h3 className="font-medium mb-3">Custom Events ({customEvents.length})</h3>
                {detailsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : customEvents.length > 0 ? (
                  <div className="space-y-2">
                    {customEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge>{event.name}</Badge>
                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {JSON.stringify(event.metadata)}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No custom events recorded</p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}