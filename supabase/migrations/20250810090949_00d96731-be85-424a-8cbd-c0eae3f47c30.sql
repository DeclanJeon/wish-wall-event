-- Create or replace the increment_comment_likes function
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_likes_count INTEGER;
BEGIN
  -- Update the likes count and return the new value
  UPDATE comments 
  SET likes = COALESCE(likes, 0) + 1,
      updated_at = now()
  WHERE id = comment_id;
  
  -- Get the updated likes count
  SELECT COALESCE(likes, 0) INTO new_likes_count
  FROM comments 
  WHERE id = comment_id;
  
  RETURN COALESCE(new_likes_count, 0);
END;
$$ LANGUAGE plpgsql;