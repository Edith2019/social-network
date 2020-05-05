DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    first VARCHAR(300) NOT NULL CHECK(first != ''),
    last VARCHAR(300) NOT NULL CHECK(last != ''),
    email VARCHAR(300) NOT NULL CHECK(email != ''),
    password VARCHAR(255) NOT NULL,
    biography VARCHAR, 
    url_profile VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

DROP TABLE IF EXISTS pw_codes;

CREATE TABLE pw_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS friendships;
  CREATE TABLE friendships (
      id SERIAL PRIMARY KEY,
      sender_id INT NOT NULL REFERENCES profiles(id),
      receiver_id INT NOT NULL REFERENCES profiles(id),
      accepted BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

DROP TABLE IF EXISTS chat;
  CREATE TABLE chat (
      id SERIAL PRIMARY KEY,
      message  VARCHAR(500) NOT NULL CHECK(message != ''),
      sender_id INT NOT NULL REFERENCES profiles(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

DROP TABLE IF EXISTS socket;
    CREATE TABLE socket (
      id SERIAL PRIMARY KEY,
      socket_id VARCHAR(300) NOT NULL,
      profile_id INT NOT NULL REFERENCES profiles(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  DROP TABLE IF EXISTS privateChat;
  CREATE TABLE privateChat (
      id SERIAL PRIMARY KEY,
      message  VARCHAR(500) NOT NULL CHECK(message != ''),
      sender_id INT NOT NULL REFERENCES profiles(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );