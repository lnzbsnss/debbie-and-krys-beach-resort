// resources\js\components\github-updates-modal.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GitBranch, Calendar, GitCommit, Tag, ExternalLink, Hash, MoreHorizontal } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { type SharedData, type GitHubUpdate } from '@/types';

interface GithubUpdatesModalProps {
    children: React.ReactNode;
}

export function GithubUpdatesModal({ children }: GithubUpdatesModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [updates, setUpdates] = useState<GitHubUpdate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.roles?.includes('admin') || false;

    useEffect(() => {
        if (isOpen && updates.length === 0) {
            fetchUpdates();
        }
    }, [isOpen]);

    const fetchUpdates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/github-updates');
            const data = await response.json();

            if (response.ok) {
                setUpdates(data);
            } else {
                throw new Error(data.error || 'Failed to fetch updates');
            }
        } catch (error) {
            let errorMessage = 'Failed to load updates';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'major': return 'bg-purple-100 text-purple-800';
            case 'minor': return 'bg-green-100 text-green-800';
            case 'patch': return 'bg-blue-100 text-blue-800';
            case 'prerelease': return 'bg-orange-100 text-orange-800';
            case 'hotfix': return 'bg-red-100 text-red-800';
            case 'release': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Updates
                    </DialogTitle>
                    <DialogDescription>
                        Latest releases
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-muted-foreground">Loading updates...</div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-destructive">{error}</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {updates.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No updates available
                            </div>
                        ) : (
                            updates.map((update, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge className={getTypeColor(update.type)}>
                                                {update.type}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Tag className="h-3 w-3" />
                                                {update.version}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {update.date}
                                            </div>
                                        </div>
                                    </div>

                                    <h4 className="font-semibold mb-2">{update.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-3">{update.description}</p>

                                    <div className="space-y-1">
                                        {update.changes.map((change, changeIndex) => (
                                            <div key={changeIndex} className="flex items-start gap-2 text-sm">
                                                {change.type === 'header' ? (
                                                    <Hash className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                                                ) : change.type === 'more' ? (
                                                    <MoreHorizontal className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                                                ) : (
                                                    <GitCommit className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                                                )}
                                                {change.text}
                                            </div>
                                        ))}
                                    </div>

                                    {index < updates.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer">
                        Mark as Read
                    </Button>
                    {isAdmin && (
                        <Button asChild>
                            <a
                                href="https://github.com/lnzbsnss/debbie-and-krys-beach-resort/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                View on GitHub
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
