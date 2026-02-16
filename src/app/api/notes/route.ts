import { NextRequest, NextResponse } from 'next/server';
import { customerNotesService } from '@/lib/customerNotes';

/**
 * API Route: /api/notes
 * Handles customer note CRUD operations
 */

// GET all notes or notes for specific customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (customerId) {
      const notes = await customerNotesService.getNotesByCustomer(customerId);
      return NextResponse.json({ success: true, data: notes });
    } else {
      const notes = await customerNotesService.getAllNotes();
      return NextResponse.json({ success: true, data: notes });
    }
  } catch (error: any) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { note, userId } = body;

    if (!note || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const noteId = await customerNotesService.createNote(note, userId);
    return NextResponse.json({ 
      success: true, 
      data: { id: noteId, ...note } 
    });
  } catch (error: any) {
    console.error('POST /api/notes error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update note
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { note, userId } = body;

    if (!note || !note.id || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await customerNotesService.updateNote(note, userId);
    return NextResponse.json({ success: true, data: note });
  } catch (error: any) {
    console.error('PUT /api/notes error:', error);
    
    // Defensive: if note doesn't exist, create it
    if (error.message?.includes('does not exist')) {
      try {
        const body = await request.json();
        const { note, userId } = body;
        const newNoteId = await customerNotesService.createNote(note, userId);
        return NextResponse.json({ 
          success: true, 
          data: { id: newNoteId, ...note },
          created: true 
        });
      } catch (createError: any) {
        return NextResponse.json(
          { success: false, error: createError.message },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json(
        { success: false, error: 'Note ID required' },
        { status: 400 }
      );
    }

    await customerNotesService.deleteNote(noteId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/notes error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
