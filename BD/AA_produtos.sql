\c db;

CREATE TABLE produto (
	id          serial      primary key,
	descricao   varchar     not null    default '',
	preco       real        not null    default 0.0,
	estoque     int         not null    default 0,
	data_		timestamp   default now()
);