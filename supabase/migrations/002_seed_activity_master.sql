-- Phase 1: Seed activity_master (dev/test only)

INSERT INTO activity_master (name, code, category, description, sort_order) VALUES
  ('Foundation', 'FND', 'Structural', 'Foundation and footing work', 1),
  ('RCC', 'RCC', 'Structural', 'Reinforced cement concrete work', 2),
  ('Brick Work', 'BRK', 'Masonry', 'Brick wall construction', 3),
  ('Plaster', 'PLT', 'Finishing', 'Plastering of walls and ceilings', 4),
  ('Electrical', 'ELC', 'MEP', 'Electrical wiring and fixtures', 5),
  ('Plumbing', 'PLB', 'MEP', 'Plumbing and sanitary work', 6),
  ('Flooring', 'FLR', 'Finishing', 'Floor tile and marble work', 7),
  ('Painting', 'PNT', 'Finishing', 'Interior and exterior painting', 8);
