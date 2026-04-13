CREATE TABLE IF NOT EXISTS communities (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  unit_count INT NOT NULL DEFAULT 0,
  created_at INT NOT NULL,
  updated_at INT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS residents (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT NULL,
  date_of_birth TEXT DEFAULT NULL,
  community_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INT NOT NULL,
  updated_at INT DEFAULT NULL,
  deleted_at INT DEFAULT NULL,
  FOREIGN KEY (community_id) REFERENCES communities(id)
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  community_id TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'general',
  starts_at INT NOT NULL,
  ends_at INT NOT NULL,
  all_day INT NOT NULL DEFAULT 0,
  capacity INT DEFAULT NULL,
  created_by TEXT DEFAULT NULL,
  created_at INT NOT NULL,
  updated_at INT DEFAULT NULL,
  FOREIGN KEY (community_id) REFERENCES communities(id)
);

CREATE TABLE IF NOT EXISTS event_attendees (
  id TEXT PRIMARY KEY NOT NULL,
  resident_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered',
  checked_in_at INT DEFAULT NULL,
  created_at INT NOT NULL,
  updated_at INT DEFAULT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (resident_id) REFERENCES residents(id)
);

CREATE TABLE IF NOT EXISTS compliance_requirements (
  id TEXT PRIMARY KEY NOT NULL,
  community_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly', -- daily, weekly, monthly, quarterly, annual
  due_date INT NOT NULL, -- period end date; compliance deadline is 30 days after this date
  created_at INT NOT NULL,
  updated_at INT DEFAULT NULL,
  FOREIGN KEY (community_id) REFERENCES communities(id)
);

CREATE TABLE IF NOT EXISTS compliance_fulfillments (
  id TEXT PRIMARY KEY NOT NULL,
  requirement_id TEXT NOT NULL,
  resident_id TEXT NOT NULL,
  event_id TEXT DEFAULT NULL,
  fulfilled_at INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed', -- pending, completed, rejected
  notes TEXT DEFAULT NULL,
  created_at INT NOT NULL,
  updated_at INT DEFAULT NULL,
  FOREIGN KEY (requirement_id) REFERENCES compliance_requirements(id),
  FOREIGN KEY (resident_id) REFERENCES residents(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);
