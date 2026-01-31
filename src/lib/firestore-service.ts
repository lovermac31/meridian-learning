// File: src/lib/firestore-service.ts
// Firestore service functions for Build 6: Video Progress Tracking

import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { EpisodeProgress } from './user';

/**
 * Save video progress for a user
 * Uses merge: true to avoid overwriting other user data
 */
export async function saveVideoProgress(
  userId: string,
  episodeId: string,
  progress: {
    lastPosition: number;
    isCompleted?: boolean;
  }
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);

    const progressData: EpisodeProgress = {
      lastPosition: progress.lastPosition,
      isCompleted: progress.isCompleted || false,
      lastWatched: new Date(),
      ...(progress.isCompleted && { completedAt: new Date() }),
    };

    // Use merge: true to only update episodeProgress without affecting other fields
    await setDoc(
      userRef,
      {
        episodeProgress: {
          [episodeId]: progressData,
        },
      },
      { merge: true }
    );

    console.log(`Progress saved: Episode ${episodeId}, Position ${progress.lastPosition}s`);
  } catch (error) {
    console.error('Error saving video progress:', error);
    throw error;
  }
}

/**
 * Get video progress for a specific episode
 */
export async function getVideoProgress(
  userId: string,
  episodeId: string
): Promise<EpisodeProgress | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    const episodeProgress = userData?.episodeProgress?.[episodeId];

    return episodeProgress || null;
  } catch (error) {
    console.error('Error getting video progress:', error);
    return null;
  }
}

/**
 * Get all episode progress for a user
 */
export async function getAllVideoProgress(
  userId: string
): Promise<{ [episodeId: string]: EpisodeProgress }> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {};
    }

    const userData = userDoc.data();
    return userData?.episodeProgress || {};
  } catch (error) {
    console.error('Error getting all video progress:', error);
    return {};
  }
}

/**
 * Mark episode as completed
 */
export async function markEpisodeComplete(
  userId: string,
  episodeId: string,
  finalPosition: number
): Promise<void> {
  try {
    await saveVideoProgress(userId, episodeId, {
      lastPosition: finalPosition,
      isCompleted: true,
    });

    console.log(`Episode ${episodeId} marked as complete`);
  } catch (error) {
    console.error('Error marking episode complete:', error);
    throw error;
  }
}
