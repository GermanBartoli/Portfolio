CREATE TABLE cupo_contacto (
  huella TEXT PRIMARY KEY,
  intentos INTEGER NOT NULL,
  vence INTEGER NOT NULL
);
CREATE INDEX contacto_por_vencimiento ON cupo_contacto(vence);
CREATE TRIGGER limpiar_cupos AFTER INSERT ON cupo_contacto
BEGIN
  DELETE FROM cupo_contacto WHERE vence <= unixepoch();
END;
