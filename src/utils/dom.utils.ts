export const copyLink = (link: string) => {
  navigator.clipboard.writeText(link).then(
    () => {
      alert('Invitation link copied to clipboard!');
    },
    (err) => {
      console.error('Could not copy text: ', err);
    }
  );
}