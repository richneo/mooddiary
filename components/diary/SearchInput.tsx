"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 h-3 w-3 text-muted-foreground" />
      <Input
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-8 text-xs"
      />
    </div>
  );
} 