'use client';

import { Calendar, ExternalLink, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

export default function NewsSection({ news = [] }) {
  if (news.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-white/5 bg-slate-900/30 text-slate-400">
        No recent news available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item, idx) => {
        // Handle sentiment coloring
        let sentimentColor = 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        let SentimentIcon = MessageSquare;

        if (item.sentiment === 'Positive') {
          sentimentColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          SentimentIcon = ThumbsUp;
        } else if (item.sentiment === 'Negative') {
          sentimentColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
          SentimentIcon = ThumbsDown;
        }

        const dateStr = item.date
          ? new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Recently';

        return (
          <div
            key={idx}
            className="glass-card hover-glow rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5 bg-slate-950/20"
          >
            <div className="space-y-2 flex-1">
              {/* Header metadata */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold text-cyan-400">{item.publisher}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <Calendar className="h-3 w-3" />
                  {dateStr}
                </span>
                {/* Sentiment Pill */}
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${sentimentColor}`}
                >
                  <SentimentIcon className="h-2.5 w-2.5" />
                  {item.sentiment || 'Neutral'}
                </span>
              </div>

              {/* Title & snippet */}
              <h4 className="text-sm font-bold text-white leading-snug tracking-tight">
                {item.title}
              </h4>
              
              {item.sentimentReason && (
                <p className="text-xs text-slate-400 italic">
                  Analysis: {item.sentimentReason}
                </p>
              )}
            </div>

            {/* Read Article link */}
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
            >
              Read Article
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        );
      })}
    </div>
  );
}
