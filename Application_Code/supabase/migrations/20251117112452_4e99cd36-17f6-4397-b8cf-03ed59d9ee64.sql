-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content TEXT,
  summary JSONB,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_sessions table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.document_sessions (
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (session_id, document_id)
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public access for demo purposes)
CREATE POLICY "Allow public read access on documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert on documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on documents" ON public.documents FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on chat_sessions" ON public.chat_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on chat_sessions" ON public.chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on chat_sessions" ON public.chat_sessions FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on document_sessions" ON public.document_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on document_sessions" ON public.document_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on document_sessions" ON public.document_sessions FOR DELETE USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_document_sessions_session_id ON public.document_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_document_sessions_document_id ON public.document_sessions(document_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for documents table
CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON public.documents
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();