-- Select all the characters that have a kill death or hs
SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, kill.k, hs.headshotKills, death.event_id FROM player
        INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o
            ON player.outfit_id = o_id
        INNER JOIN (SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths GROUP BY death_id) AS death
            ON character_id = death_id
        INNER JOIN (SELECT attacker_character_id AS attack_id, COUNT (attacker_character_id) as k FROM deaths GROUP BY attack_id) AS kill
            ON character_id = attack_id
        INNER JOIN (SELECT attacker_character_id AS hs_id, COUNT (is_headshot) as headshotKills FROM deaths GROUP BY hs_id) AS hs
            ON character_id = hs_id

-- Select the killers and return the top 25 characters
SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, kill.k, kill.event_id FROM player
        INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o
            ON player.outfit_id = o_id
        INNER JOIN (SELECT attacker_character_id AS attack_id, event_id, COUNT (attacker_character_id) as k FROM deaths GROUP BY attack_id) AS kill
            ON character_id = attack_id
        ORDER BY k desc
		LIMIT 25

-- Select the deaths of characters and return the top 25
SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, death.d, death.event_id FROM player
        INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o
            ON player.outfit_id = o_id
        INNER JOIN (SELECT loser_character_id AS death_id, event_id, COUNT (loser_character_id) AS d FROM deaths GROUP BY death_id) AS death
            ON character_id = death_id
        ORDER BY d desc
		LIMIT 25

-- Select the headshots and return the top 25
SELECT character_id, name,  o.faction, outfit_id,  o.o_name, o.o_alias, hs.headshotKills, hs.event_id FROM player
        INNER JOIN (SELECT outfit_id AS o_id ,name AS o_name, alias AS o_alias, faction FROM outfit GROUP BY o_id)  AS o
            ON player.outfit_id = o_id
		INNER JOIN (SELECT attacker_character_id AS hs_id, event_id, COUNT (is_headshot) as headshotKills FROM deaths GROUP BY hs_id) AS hs
            ON character_id = hs_id
        ORDER BY headshotKills desc
		LIMIT 25

-- Select top 25 xp recievers of xp type (replace type1 and type2) used where there is a normal ribbon and a squad version
SELECT character_id, COUNT(character_id) AS xpEvent FROM xp WHERE experience_id=TYPE1 OR experience_id=TYPE2 GROUP BY character_id LIMIT 25