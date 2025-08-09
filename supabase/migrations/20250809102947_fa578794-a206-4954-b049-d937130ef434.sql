-- Add card styling columns to posts table
ALTER TABLE public.posts 
ADD COLUMN card_style TEXT DEFAULT 'letter',
ADD COLUMN card_color TEXT DEFAULT 'white';

-- Rename author column to name in posts table
ALTER TABLE public.posts 
RENAME COLUMN author TO name;

-- Update comments table structure for nested replies
ALTER TABLE public.comments 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create trigger for comments updated_at
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update comment structure to support rich text content
ALTER TABLE public.comments 
ALTER COLUMN message TYPE TEXT;