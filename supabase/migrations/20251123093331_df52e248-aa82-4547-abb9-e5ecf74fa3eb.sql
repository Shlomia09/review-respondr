-- Delete all Facebook reviews to force re-sync with correct open_graph_story IDs
DELETE FROM reviews WHERE platform = 'facebook';