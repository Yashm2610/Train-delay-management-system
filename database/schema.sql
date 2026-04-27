-- ============================================================
-- Train Delay Management System — Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS train_delay_management_system;
USE train_delay_management_system;

-- ============================================================
-- TABLE 0: Users (Roles: Admin, Station Manager, User)
-- ============================================================
CREATE TABLE IF NOT EXISTS Users (
    user_id    INT          NOT NULL AUTO_INCREMENT,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('Admin', 'Station Manager', 'User') NOT NULL DEFAULT 'User',
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- ============================================================
-- TABLE 1: Stations
-- (Created before Trains because Trains references Stations)
-- ============================================================
CREATE TABLE IF NOT EXISTS Stations (
    station_code   VARCHAR(10)  NOT NULL,
    station_name   VARCHAR(100) NOT NULL,
    city           VARCHAR(100) NOT NULL,
    state          VARCHAR(100) NOT NULL,
    PRIMARY KEY (station_code)
);

-- ============================================================
-- TABLE 2: Trains
-- ============================================================
CREATE TABLE IF NOT EXISTS Trains (
    train_num            VARCHAR(10)  NOT NULL,
    train_name           VARCHAR(100) NOT NULL,
    source_station       VARCHAR(10)  NOT NULL,
    destination_station  VARCHAR(10)  NOT NULL,
    total_stations       INT          NOT NULL DEFAULT 1,
    PRIMARY KEY (train_num),
    FOREIGN KEY (source_station)      REFERENCES Stations(station_code) ON UPDATE CASCADE,
    FOREIGN KEY (destination_station) REFERENCES Stations(station_code) ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 3: Delay_Stats
-- ============================================================
CREATE TABLE IF NOT EXISTS Delay_Stats (
    stat_id               INT            NOT NULL AUTO_INCREMENT,
    train_num             VARCHAR(10)    NOT NULL,
    station_code          VARCHAR(10)    NOT NULL,
    average_delay_minutes DECIMAL(6, 2)  NOT NULL DEFAULT 0.00,
    PRIMARY KEY (stat_id),
    FOREIGN KEY (train_num)    REFERENCES Trains(train_num)     ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (station_code) REFERENCES Stations(station_code) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 4: Delay_Percentage
-- ============================================================
CREATE TABLE IF NOT EXISTS Delay_Percentage (
    pct_id                  INT           NOT NULL AUTO_INCREMENT,
    train_num               VARCHAR(10)   NOT NULL,
    station_code            VARCHAR(10)   NOT NULL,
    pct_right_time          DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    pct_slight_delay        DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    pct_significant_delay   DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    pct_cancelled_unknown   DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (pct_id),
    FOREIGN KEY (train_num)    REFERENCES Trains(train_num)      ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (station_code) REFERENCES Stations(station_code) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABLE 5: Update_Log
-- ============================================================
CREATE TABLE IF NOT EXISTS Update_Log (
    log_id     INT         NOT NULL AUTO_INCREMENT,
    train_num  VARCHAR(10) NOT NULL,
    scraped_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (log_id),
    FOREIGN KEY (train_num) REFERENCES Trains(train_num) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- SAMPLE DATA — Stations
-- ============================================================
INSERT INTO Stations (station_code, station_name, city, state) VALUES
('NDLS', 'New Delhi',          'New Delhi',  'Delhi'),
('MMCT', 'Mumbai Central',     'Mumbai',     'Maharashtra'),
('MAS',  'Chennai Central',    'Chennai',    'Tamil Nadu'),
('SBC',  'Bengaluru City',     'Bengaluru',  'Karnataka'),
('HWH',  'Howrah Junction',    'Kolkata',    'West Bengal'),
('ADI',  'Ahmedabad Junction', 'Ahmedabad',  'Gujarat'),
('JP',   'Jaipur Junction',    'Jaipur',     'Rajasthan'),
('LKO',  'Lucknow Charbagh',   'Lucknow',    'Uttar Pradesh'),
('NGP',  'Nagpur Junction',    'Nagpur',     'Maharashtra'),
('SC',   'Secunderabad',       'Hyderabad',  'Telangana');

-- ============================================================
-- SAMPLE DATA — Trains
-- ============================================================
INSERT INTO Trains (train_num, train_name, source_station, destination_station, total_stations) VALUES
('12951', 'Mumbai Rajdhani',       'NDLS', 'MMCT', 8),
('12627', 'Karnataka Express',     'NDLS', 'SBC',  22),
('12301', 'Howrah Rajdhani',       'NDLS', 'HWH',  14),
('12009', 'Mumbai Shatabdi',       'MMCT', 'ADI',   6),
('12657', 'Chennai Mail',          'MAS',  'NDLS',  18),
('12029', 'Amritsar Shatabdi',     'NDLS', 'JP',    5),
('22221', 'Rajdhani Premium',      'NDLS', 'LKO',   9),
('12139', 'Sewagram Express',      'NDLS', 'NGP',  11),
('12723', 'Telangana Express',     'NDLS', 'SC',   20),
('16588', 'Bengaluru Express',     'SBC',  'MAS',  14);

-- ============================================================
-- SAMPLE DATA — Delay_Stats
-- ============================================================
INSERT INTO Delay_Stats (train_num, station_code, average_delay_minutes) VALUES
('12951', 'NDLS',  2.50),
('12951', 'ADI',   8.30),
('12951', 'MMCT', 12.10),
('12627', 'NDLS',  5.00),
('12627', 'NGP',  18.40),
('12627', 'SBC',  22.70),
('12301', 'NDLS',  3.00),
('12301', 'LKO',  10.50),
('12301', 'HWH',  14.20),
('12009', 'MMCT',  1.50),
('12009', 'ADI',   4.80),
('12657', 'MAS',   6.00),
('12657', 'NGP',  20.30),
('12657', 'NDLS', 35.60),
('22221', 'NDLS',  0.50),
('22221', 'LKO',   3.20),
('12723', 'NDLS',  7.00),
('12723', 'SC',   29.80),
('16588', 'SBC',   5.50),
('16588', 'MAS',  11.20);

-- ============================================================
-- SAMPLE DATA — Delay_Percentage
-- ============================================================
INSERT INTO Delay_Percentage (train_num, station_code, pct_right_time, pct_slight_delay, pct_significant_delay, pct_cancelled_unknown) VALUES
('12951', 'NDLS',  78.50, 12.30, 7.20,  2.00),
('12951', 'MMCT',  65.20, 18.40, 13.10, 3.30),
('12627', 'NDLS',  60.00, 22.00, 15.00, 3.00),
('12627', 'SBC',   52.30, 25.10, 18.60, 4.00),
('12301', 'NDLS',  80.00, 10.00,  7.50, 2.50),
('12301', 'HWH',   70.40, 16.20, 10.80, 2.60),
('12009', 'MMCT',  88.00,  8.00,  3.00, 1.00),
('12009', 'ADI',   82.50, 10.50,  5.00, 2.00),
('12657', 'MAS',   55.00, 24.00, 17.50, 3.50),
('12657', 'NDLS',  45.00, 28.00, 21.00, 6.00),
('22221', 'NDLS',  92.00,  5.00,  2.00, 1.00),
('22221', 'LKO',   88.50,  7.50,  3.00, 1.00),
('12723', 'NDLS',  58.00, 23.00, 15.00, 4.00),
('12723', 'SC',    44.20, 29.30, 21.50, 5.00),
('16588', 'SBC',   70.00, 17.00, 10.00, 3.00),
('16588', 'MAS',   63.80, 19.50, 13.70, 3.00);

-- ============================================================
-- SAMPLE DATA — Update_Log
-- ============================================================
INSERT INTO Update_Log (train_num, scraped_at) VALUES
('12951', '2026-04-15 08:00:00'),
('12627', '2026-04-15 08:05:00'),
('12301', '2026-04-15 08:10:00'),
('12009', '2026-04-15 09:00:00'),
('12657', '2026-04-15 09:05:00'),
('22221', '2026-04-15 09:10:00'),
('12723', '2026-04-15 10:00:00'),
('16588', '2026-04-15 10:05:00'),
('12951', '2026-04-16 08:00:00'),
('12627', '2026-04-16 08:05:00'),
('12301', '2026-04-16 08:10:00'),
('12009', '2026-04-16 09:00:00'),
('12723', '2026-04-16 09:30:00'),
('22221', '2026-04-16 10:00:00');

-- ============================================================
-- SAMPLE DATA — Users
-- ============================================================
INSERT INTO Users (username, password, role) VALUES
('admin',   'admin123',   'Admin'),
('manager', 'manager123', 'Station Manager'),
('user',    'user123',    'User');
