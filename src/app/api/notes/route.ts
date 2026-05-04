import { NextRequest, NextResponse } from 'next/server';
import { customerNotesService } from '@/lib/customerNotes';
import { authorizeApiRequest, forbidUserIdMismatch } from '@/lib/server/authorizeApiRequest';
import type { CustomerNote } from '@/types';

/**
 * API Route: /api/notes
 * Bearer auth enforced when Firebase Admin credentials are configured.
 */

export async function GET(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (customerId) {
      const notes = await customerNotesService.getNotesByCustomer(customerId);
      return NextResponse.json({ success: true, data: notes });
    }
    const notes = await customerNotesService.getAllNotes();
    return NextResponse.json({ success: true, data: notes });
  } catch (error: unknown) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { note, userId }: { note?: CustomerNote; userId?: string } = body;

    if (!note || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const forbidden = forbidUserIdMismatch(auth.uid, userId);
    if (forbidden) return forbidden;

    const noteId = await customerNotesService.createNote(note, userId);
    return NextResponse.json({
      success: true,
      data: { ...note, id: noteId },
    });
  } catch (error: unknown) {
    console.error('POST /api/notes error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  let body: { note?: CustomerNote; userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const { note, userId } = body;

    if (!note || !note.id || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const forbidden = forbidUserIdMismatch(auth.uid, userId);
    if (forbidden) return forbidden;

    await customerNotesService.updateNote(note, userId);
    return NextResponse.json({ success: true, data: note });
  } catch (error: unknown) {
    console.error('PUT /api/notes error:', error);

    if (error instanceof Error && error.message?.includes('does not exist')) {
      try {
        const { note, userId } = body;
        if (!note || !userId) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        const forbidden = forbidUserIdMismatch(auth.uid, userId);
        if (forbidden) return forbidden;
        const newNoteId = await customerNotesService.createNote(note, userId);
        return NextResponse.json({
          success: true,
          data: { ...note, id: newNoteId },
          created: true,
        });
      } catch (createError: unknown) {
        return NextResponse.json(
          { success: false, error: createError instanceof Error ? createError.message : 'Server error' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json({ success: false, error: 'Note ID required' }, { status: 400 });
    }

    await customerNotesService.deleteNote(noteId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE /api/notes error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}
