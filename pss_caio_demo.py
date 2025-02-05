#!/usr/bin/env python3

"""
PSS CAIO Demo Alpha - Simplified Version
A basic speech-to-text simulation with content discovery features.
"""

from datetime import datetime
from typing import Dict, List
from urllib.parse import quote_plus

class TranscriptionSegment:
    def __init__(self, text: str, timestamp: datetime):
        self.text = text
        self.timestamp = timestamp
        self.keywords = self._extract_keywords()
    
    def _extract_keywords(self) -> List[str]:
        words = self.text.lower().split()
        stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'}
        keywords = [word for word in words if word not in stopwords and len(word) > 3]
        return list(set(keywords))[:5]  # Top 5 unique keywords

class ContentDiscovery:
    def __init__(self):
        self.trusted_sources = [
            "https://developer.mozilla.org",
            "https://docs.python.org",
            "https://stackoverflow.com/questions"
        ]
    
    def generate_links(self, keywords: List[str]) -> List[str]:
        links = []
        for keyword in keywords:
            for source in self.trusted_sources:
                links.append(f"{source}/search?q={quote_plus(keyword)}")
        return links[:5]  # Return top 5 links

class TranscriptionManager:
    def __init__(self):
        self.segments = []
        self.content_discovery = ContentDiscovery()
    
    def start(self):
        print("PSS CAIO Demo Alpha - Simplified Version")
        print("=" * 40)
        print("Enter text to simulate speech (press Enter without text to stop)")
        print("-" * 40)
        
        while True:
            text = input("> ")
            if not text:
                break
            
            segment = TranscriptionSegment(text, datetime.now())
            self.segments.append(segment)
            print(f"[{segment.timestamp.strftime('%H:%M:%S')}] Recorded")
        
        self.display_results()
    
    def display_results(self):
        if not self.segments:
            print("\nNo transcription recorded.")
            return
        
        print("\nTranscript:")
        print("-" * 40)
        
        all_keywords = set()
        for segment in self.segments:
            print(f"[{segment.timestamp.strftime('%H:%M:%S')}] {segment.text}")
            all_keywords.update(segment.keywords)
        
        if all_keywords:
            print("\nKeywords found:", ", ".join(all_keywords))
            links = self.content_discovery.generate_links(list(all_keywords))
            
            print("\nRelevant Resources:")
            for link in links:
                print(f"- {link}")

def main():
    try:
        manager = TranscriptionManager()
        manager.start()
    except KeyboardInterrupt:
        print("\nProgram terminated by user.")
    except Exception as e:
        print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    main()