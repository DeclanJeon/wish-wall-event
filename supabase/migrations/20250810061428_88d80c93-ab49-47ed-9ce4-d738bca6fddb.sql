-- Add affiliation column to posts table
ALTER TABLE public.posts ADD COLUMN affiliation text;

-- Add password column to posts table for editing/deleting
ALTER TABLE public.posts ADD COLUMN password text;

-- Add likes column to comments table
ALTER TABLE public.comments ADD COLUMN likes integer NOT NULL DEFAULT 0;

-- Add comments_count column to posts table for quick access
ALTER TABLE public.comments ADD COLUMN comments_count integer NOT NULL DEFAULT 0;

-- Create function to increment comment likes
CREATE OR REPLACE FUNCTION public.increment_comment_likes(comment_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $function$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE comments 
  SET likes = likes + 1 
  WHERE id = comment_id;
  
  SELECT likes INTO new_count
  FROM comments 
  WHERE id = comment_id;
  
  RETURN new_count;
END;
$function$;