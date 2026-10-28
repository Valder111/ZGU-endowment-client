/** Shared geometry keeps the community symbol consistent at every size. */
export function CommunityPeople() {
  return (
    <>
      <circle cx="100" cy="46" r="17" />
      <circle cx="48" cy="63" r="13" />
      <circle cx="152" cy="63" r="13" />
      <path d="M70 122V100a30 30 0 0 1 60 0v22H70Z" />
      <path d="M29 122V102a22 22 0 0 1 30-20m112 40v-20a22 22 0 0 0-30-20M25 122h34m82 0h34" />
    </>
  );
}
