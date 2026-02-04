'use client';

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card";

interface SubscriptionControlsProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterCategory: string;
    onCategoryChange: (value: string) => void;
    sortOption: string;
    onSortChange: (value: string) => void;
}

const categories = ['All Categories', 'Streaming', 'Software', 'Cloud', 'Education', 'Utilities', 'Others'];

export function SubscriptionControls({
    searchTerm,
    onSearchChange,
    filterCategory,
    onCategoryChange,
    sortOption,
    onSortChange
}: SubscriptionControlsProps) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-200 ease-in-out hover:shadow-lg">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="md:col-span-1"
                    />
                    <Select value={filterCategory} onValueChange={onCategoryChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat === 'All Categories' ? 'All' : cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select value={sortOption} onValueChange={onSortChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="renewalDate-asc">Sort by Renewal Date (Nearest)</SelectItem>
                            <SelectItem value="name-asc">Sort by Name (A-Z)</SelectItem>
                            <SelectItem value="amount-asc">Sort by Amount (Low to High)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}
