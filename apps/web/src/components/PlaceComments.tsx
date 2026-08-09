'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { placeCommentService } from '@/lib/place-comments';
import { PlaceComment, User, Roles } from '@whats-up-addis/shared';
import { formatDistanceToNow } from 'date-fns';

interface PlaceCommentsProps {
  placeId: string;
}

export default function PlaceComments({ placeId }: PlaceCommentsProps) {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<PlaceComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    commentId: string | null;
  }>({ isOpen: false, commentId: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Error fetching user:', err);
        }
      }

      fetchComments();
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  const fetchComments = async () => {
    try {
      const data = await placeCommentService.getComments(placeId);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    try {
      setError(null);
      await placeCommentService.createComment(placeId, {
        content: newComment,
        parentCommentId: replyTo || undefined,
      });
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    }
  };

  const handleToggleLike = async (commentId: string) => {
    if (!user) return;
    // Optimistic update
    setComments((prev) =>
      updateCommentLike(prev, commentId, (c) => ({
        ...c,
        isLikedByUser: !c.isLikedByUser,
        likesCount: (c.likesCount ?? 0) + (c.isLikedByUser ? -1 : 1),
      }))
    );
    try {
      setError(null);
      await placeCommentService.toggleLike(placeId, commentId);
    } catch (err: unknown) {
      // Revert on failure
      fetchComments();
      setError(err instanceof Error ? err.message : 'Failed to like comment');
    }
  };

  const updateCommentLike = (
    list: PlaceComment[],
    commentId: string,
    updater: (c: PlaceComment) => PlaceComment
  ): PlaceComment[] =>
    list.map((c) => {
      if (c.id === commentId) return updater(c);
      if (c.replies) {
        return {
          ...c,
          replies: updateCommentLike(c.replies, commentId, updater),
        };
      }
      return c;
    });

  const handleDeleteComment = (commentId: string) => {
    setDeleteConfirmation({ isOpen: true, commentId });
  };

  const confirmDeleteComment = async () => {
    if (!deleteConfirmation.commentId) return;
    try {
      setError(null);
      await placeCommentService.deleteComment(
        placeId,
        deleteConfirmation.commentId
      );
      setDeleteConfirmation({ isOpen: false, commentId: null });
      fetchComments();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      setDeleteConfirmation({ isOpen: false, commentId: null });
    }
  };

  const cancelDeleteComment = () => {
    setDeleteConfirmation({ isOpen: false, commentId: null });
  };

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: PlaceComment;
    isReply?: boolean;
  }) => (
    <div
      className={`${isReply ? 'ml-10 mt-3' : 'py-4'} border-l-2 border-border pl-4`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="mb-1.5 flex items-baseline gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.user.name}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {comment.content}
          </p>
          <div className="mt-2 flex items-center gap-4">
            <button
              onClick={() => handleToggleLike(comment.id)}
              disabled={!user}
              className={`flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40 ${
                comment.isLikedByUser
                  ? 'text-ember'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ♥ {comment.likesCount ?? 0}
            </button>
            {!isReply && user && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                Reply
              </button>
            )}
            {user &&
              (user.id === comment.userId || user.role === Roles.Admin) && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="font-mono text-[10px] uppercase tracking-widest text-destructive transition-colors hover:text-destructive/10"
                >
                  Delete
                </button>
              )}
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  );

  const ConfirmDialog = () => {
    if (!deleteConfirmation.isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
          <h3 className="font-display text-xl">Delete Comment</h3>
          <p className="mt-2 mb-6 text-sm text-muted-foreground">
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={cancelDeleteComment}
              className="inline-flex h-9 items-center rounded-full border border-border px-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteComment}
              className="inline-flex h-9 items-center rounded-full bg-destructive px-4 font-mono text-[11px] uppercase tracking-widest text-destructive-foreground transition-transform hover:-translate-y-0.5"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <span className="font-mono text-[10px] uppercase tracking-widest text-ember">
        Discussion
      </span>
      <h2 className="mt-1 font-display text-2xl">Comments</h2>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmitComment} className="mt-5 space-y-3">
          {replyTo && (
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Replying to comment…{' '}
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-ember hover:opacity-80"
              >
                Cancel
              </button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment…"
            rows={3}
            required
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-full bg-ember px-5 font-mono text-[11px] uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5"
          >
            Post Comment
          </button>
        </form>
      )}

      {!user && (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Sign in to join the discussion
        </p>
      )}

      <div className="mt-6">
        {isLoadingComments ? (
          <p className="font-mono text-xs text-muted-foreground">Loading…</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first!
          </p>
        ) : (
          <div className="divide-y divide-border">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog />
    </div>
  );
}
