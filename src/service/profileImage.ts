export function getProfileUrl(user: any): string {
  return user.avatar
    ? user.avatar.includes("http")
      ? user.avatar
      : `${`${import.meta.env.VITE_STORAGE_URL}/${user.avatar}`}`
    : "https://via.placeholder.com/150";
}
