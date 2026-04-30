// ============================================================
// SUPABASE — Client & helpers
// ============================================================

const _SUPA_URL = 'https://xcwhnzoliodnkkyyjbrh.supabase.co'
const _SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2huem9saW9kbmtreXlqYnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDM3MzcsImV4cCI6MjA5MjM3OTczN30.5h4ZfCKbjg0sV9KjDL7r-pWp7LZUDvb6Jn1Qqrfc-Zo'

function _db() {
	if (!window._supabaseClient) {
		window._supabaseClient = window.supabase.createClient(_SUPA_URL, _SUPA_KEY)
	}
	return window._supabaseClient
}

// --- Stats ---

async function sbGetStats(uid) {
	const { data } = await _db()
		.from('user_stats')
		.select('*')
		.eq('user_id', uid)
		.limit(1)
	return data?.[0] ?? null
}

async function sbTrackRead(uid) {
	const today     = new Date().toISOString().slice(0, 10)
	const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

	const stats = await sbGetStats(uid)

	let streak    = stats?.streak    ?? 0
	let streakMax = stats?.streak_max ?? 0
	const lastDate = stats?.last_read_date

	if (lastDate !== today) {
		streak    = lastDate === yesterday ? streak + 1 : 1
		streakMax = Math.max(streak, streakMax)
	}

	await _db().from('user_stats').upsert({
		user_id:        uid,
		streak,
		streak_max:     streakMax,
		last_read_date: today
	})

	return { streak, streakMax }
}

// --- Helpers génériques ---

async function _sbGetVerses(table, uid) {
	const { data } = await _db()
		.from(table)
		.select('*')
		.eq('user_id', uid)
		.order('created_at', { ascending: false })
	return data || []
}

async function _sbAddVerse(table, uid, ref, text) {
	await _db().from(table).upsert(
		{ user_id: uid, ref, ...(text !== undefined ? { text } : {}) },
		{ onConflict: 'user_id,ref' }
	)
}

async function _sbRemoveVerse(table, uid, ref) {
	await _db().from(table).delete().eq('user_id', uid).eq('ref', ref)
}

// --- Favoris ---
async function sbGetFavorites(uid)              { return _sbGetVerses('favorites', uid) }
async function sbAddFavorite(uid, ref, text)    { return _sbAddVerse('favorites', uid, ref, text) }
async function sbRemoveFavorite(uid, ref)       { return _sbRemoveVerse('favorites', uid, ref) }

// --- Enregistrés ---
async function sbGetSaved(uid)                  { return _sbGetVerses('saved_verses', uid) }
async function sbAddSaved(uid, ref, text)       { return _sbAddVerse('saved_verses', uid, ref, text) }
async function sbRemoveSaved(uid, ref)          { return _sbRemoveVerse('saved_verses', uid, ref) }

// --- Lus ---
async function sbGetRead(uid)                   { return _sbGetVerses('read_verses', uid) }
async function sbAddRead(uid, ref)              { return _sbAddVerse('read_verses', uid, ref, undefined) }
async function sbRemoveRead(uid, ref)           { return _sbRemoveVerse('read_verses', uid, ref) }

// --- Profiles ---

async function sbGetProfile(uid) {
	const { data } = await _db().from('profiles').select('*').eq('user_id', uid).limit(1)
	return data?.[0] ?? null
}

async function sbEnsureProfile(uid, username) {
	await _db().from('profiles').upsert({ user_id: uid, username }, { onConflict: 'user_id' })
	return sbGetProfile(uid)
}

async function sbGetAllProfiles() {
	const { data } = await _db().from('profiles').select('*').order('created_at', { ascending: false })
	return data || []
}

async function sbGetProfilesByIds(ids) {
	if (!ids.length) return []
	const { data } = await _db().from('profiles').select('*').in('user_id', ids)
	return data || []
}

// --- Posts ---

async function sbGetPosts(limit = 40) {
	const { data } = await _db().from('posts').select('*').order('created_at', { ascending: false }).limit(limit)
	return data || []
}

async function sbGetUserPosts(uid) {
	const { data } = await _db().from('posts').select('*').eq('user_id', uid).order('created_at', { ascending: false })
	return data || []
}

async function sbCreatePost({ uid, username, verseRef, verseText, content }) {
	const { data, error } = await _db().from('posts').insert({
		user_id: uid, username,
		verse_ref: verseRef || null,
		verse_text: verseText || null,
		content: content || null
	}).select()
	if (error) throw error
	return data?.[0]
}

async function sbDeletePost(postId) {
	await _db().from('posts').delete().eq('id', postId)
}

async function sbGetLikedPostIds(uid) {
	const { data } = await _db().from('post_likes').select('post_id').eq('user_id', uid)
	return (data || []).map(l => l.post_id)
}

async function sbLikePost(uid, postId) {
	const { error } = await _db().from('post_likes').insert({ user_id: uid, post_id: postId })
	if (error) return
	const { data } = await _db().from('posts').select('likes_count').eq('id', postId).maybeSingle()
	await _db().from('posts').update({ likes_count: (data?.likes_count || 0) + 1 }).eq('id', postId)
}

async function sbUnlikePost(uid, postId) {
	await _db().from('post_likes').delete().eq('user_id', uid).eq('post_id', postId)
	const { data } = await _db().from('posts').select('likes_count').eq('id', postId).maybeSingle()
	await _db().from('posts').update({ likes_count: Math.max(0, (data?.likes_count || 0) - 1) }).eq('id', postId)
}

// --- Friendships ---

async function sbSendFriendRequest(requesterId, addresseeId) {
	const { error } = await _db().from('friendships').insert({ requester_id: requesterId, addressee_id: addresseeId })
	return !error
}

async function sbGetFriendStatus(uid, targetId) {
	const { data } = await _db().from('friendships')
		.select('*')
		.or(`and(requester_id.eq.${uid},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${uid})`)
		.maybeSingle()
	return data ?? null
}

async function sbGetPendingRequests(uid) {
	const { data } = await _db().from('friendships').select('*').eq('addressee_id', uid).eq('status', 'pending')
	return data || []
}

async function sbGetFriends(uid) {
	const { data: sent } = await _db().from('friendships').select('*').eq('requester_id', uid).eq('status', 'accepted')
	const { data: recv } = await _db().from('friendships').select('*').eq('addressee_id', uid).eq('status', 'accepted')
	return [...(sent || []), ...(recv || [])]
}

async function sbAcceptFriend(requesterId, addresseeId) {
	await _db().from('friendships').update({ status: 'accepted' }).eq('requester_id', requesterId).eq('addressee_id', addresseeId)
}

async function sbRejectFriend(requesterId, addresseeId) {
	await _db().from('friendships').delete().eq('requester_id', requesterId).eq('addressee_id', addresseeId)
}

// --- Reports ---

async function sbReport({ reporterId, type, id, username, reason }) {
	await _db().from('reports').insert({
		reporter_id: reporterId, reported_type: type,
		reported_id: id, reported_username: username || null, reason
	})
}

async function sbGetReports() {
	const { data } = await _db().from('reports').select('*').eq('status', 'pending').order('created_at', { ascending: false })
	return data || []
}

async function sbResolveReport(reportId) {
	await _db().from('reports').update({ status: 'resolved' }).eq('id', reportId)
}
