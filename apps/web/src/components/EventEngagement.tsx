'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { commentService } from '@/lib/comments';
import { ratingService } from '@/lib/ratings';
import type { Comment, EventRatingStats, User } from '@whats-up-addis/shared';
import { formatDistanceToNow } from 'date-fns';

interface EventEngagementProps {
  eventId: string;
}

export default function EventEngagement({ eventId }: EventEngagementProps) {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratingStats, setRatingStats] = useState<EventRatingStats | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);
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
      fetchRatings();
    };

    initialize();
  }, [eventId]);

  const fetchComments = async () => {
    try {
      const data = await commentService.getComments(eventId);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const stats = await ratingService.getRatingStats(eventId);
      setRatingStats(stats);
      if (stats.userRating) {
        setSelectedRating(stats.userRating);
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setIsLoadingRatings(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) return;

    try {
      setError(null);
      await ratingService.createOrUpdateRating(eventId, { rating });
      setSelectedRating(rating);
      fetchRatings();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      setError(null);
      await commentService.createComment(eventId, {
        content: newComment,
        parentCommentId: replyTo || undefined,
      });
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    }
  };

  const handleToggleLike = async (commentId: string) => {
    if (!user) return;

    try {
      setError(null);
      await commentService.toggleLike(commentId);
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to like comment');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setDeleteConfirmation({ isOpen: true, commentId });
  };

  const confirmDeleteComment = async () => {
    if (!deleteConfirmation.commentId) return;

    try {
      setError(null);
      await commentService.deleteComment(deleteConfirmation.commentId);
      setDeleteConfirmation({ isOpen: false, commentId: null });
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
      setDeleteConfirmation({ isOpen: false, commentId: null });
    }
  };

  const cancelDeleteComment = () => {
    setDeleteConfirmation({ isOpen: false, commentId: null });
  };

  const StarRating = ({ rating, onRate, readonly = false }: { rating: number; onRate?: (r: number) => void; readonly?: boolean }) => {
    const renderStar = (position: number) => {
      const isFullStar = position <= rating;
      const isHalfStar = position === Math.ceil(rating) && rating % 1 !== 0;

      if (readonly && isHalfStar) {
        // Show half star for readonly ratings
        const percentage = ((rating % 1) * 100).toFixed(0);
        return (
          <div key={position} className="relative inline-block text-2xl">
            <span className="text-gray-300 dark:text-gray-600">★</span>
            <span
              className="absolute top-0 left-0 text-yellow-400 overflow-hidden"
              style={{ width: `${percentage}%` }}
            >
              ★
            </span>
          </div>
        );
      }

      return (
        <button
          key={position}
          type="button"
          disabled={readonly || !user}
          onClick={() => onRate?.(position)}
          className={`text-2xl ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform ${
            isFullStar ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          ★
        </button>
      );
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => renderStar(star))}
      </div>
    );
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12 mt-4' : 'mb-6'} border-l-2 border-gray-200 dark:border-gray-700 pl-4`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 dark:text-white">{comment.user.name}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => handleToggleLike(comment.id)}
              disabled={!user}
              className={`flex items-center gap-1 text-sm ${
                comment.isLikedByUser ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
              } hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50`}
            >
              ❤️ {comment.likesCount}
            </button>
            {!isReply && user && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Reply
              </button>
            )}
            {user && (user.id === comment.userId || user.role === 'ADMIN') && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-600"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Delete Comment
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to delete this comment? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDeleteComment}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteComment}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Ratings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rate This Event</h2>
        {isLoadingRatings ? (
          <div className="text-gray-600 dark:text-gray-400">Loading ratings...</div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {ratingStats?.averageRating.toFixed(1) || '0.0'}
              </div>
              <div>
                <StarRating rating={ratingStats?.averageRating || 0} readonly />
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {ratingStats?.totalRatings || 0} ratings
                </div>
              </div>
            </div>
            {user && (
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Your rating:</p>
                <StarRating rating={selectedRating} onRate={handleRating} />
              </div>
            )}
            {!user && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Please log in to rate this event
              </p>
            )}
          </>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Comments</h2>

        {user && (
          <form onSubmit={handleSubmitComment} className="mb-8">
            {replyTo && (
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Replying to comment...{' '}
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-primary-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Post Comment
            </button>
          </form>
        )}

        {!user && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-6">
            Please log in to comment
          </p>
        )}

        {isLoadingComments ? (
          <div className="text-gray-600 dark:text-gray-400">Loading comments...</div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
        ) : (
          <div>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  );
}
