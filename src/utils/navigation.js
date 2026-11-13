export function goBackOrHome(navigate, location) {
  if (location.key !== "default") {
    navigate(-1);
  } else {
    navigate("/", { replace: true });
  }
}
