USE tempstars;

DELIMITER //
CREATE TRIGGER tempstars.insert_location
BEFORE INSERT ON tempstars.Hygienist FOR EACH ROW
BEGIN
	SET NEW.location = POINT(NEW.lon, NEW.lat);
END; //

CREATE TRIGGER tempstars.update_location
BEFORE UPDATE ON tempstars.Hygienist FOR EACH ROW
BEGIN
	SET NEW.location = POINT(NEW.lon, NEW.lat);
END; //
DELIMITER ;
