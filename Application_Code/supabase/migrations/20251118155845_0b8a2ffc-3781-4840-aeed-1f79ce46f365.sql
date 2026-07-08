-- Enable Row Level Security on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to view all messages (since we don't have auth yet)
CREATE POLICY "Allow public read access to messages"
  ON public.messages
  FOR SELECT
  USING (true);

-- Create policy to allow all users to insert messages
CREATE POLICY "Allow public insert access to messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow all users to update messages
CREATE POLICY "Allow public update access to messages"
  ON public.messages
  FOR UPDATE
  USING (true);

-- Create policy to allow all users to delete messages
CREATE POLICY "Allow public delete access to messages"
  ON public.messages
  FOR DELETE
  USING (true);