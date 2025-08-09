-- Create function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE posts 
  SET likes = likes + 1 
  WHERE id = post_id;
  
  SELECT likes INTO new_count
  FROM posts 
  WHERE id = post_id;
  
  RETURN new_count;
END;
$$;