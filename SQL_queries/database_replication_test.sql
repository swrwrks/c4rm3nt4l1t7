--Master request
SELECT client_addr, state, sent_lsn FROM pg_stat_replication;

--Slave request
SELECT pg_is_in_recovery();
