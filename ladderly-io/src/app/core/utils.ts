export type UserLike = {
  nameFirst: string | null
  nameLast: string | null
  id: number
}

export const getUserDisplayName = (userLike: UserLike) => {
  return userLike.nameFirst
    ? userLike.nameFirst + (userLike.nameLast ? ` ${userLike.nameLast}` : '')
    : userLike.nameLast
      ? userLike.nameLast
      : `User ${userLike.id}`
}
