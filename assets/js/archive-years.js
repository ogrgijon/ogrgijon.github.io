document.querySelectorAll(".archive-year-picker").forEach((picker) => {
  const buttons = picker.querySelectorAll("[data-archive-year]");
  const cards = picker.nextElementSibling?.querySelectorAll("[data-story-year]");
  const currentYear = picker.querySelector("[data-current-year]");

  if (!cards?.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedYear = button.dataset.archiveYear;

      buttons.forEach((yearButton) => {
        yearButton.setAttribute("aria-pressed", String(yearButton === button));
      });

      if (currentYear) currentYear.textContent = selectedYear;

      cards.forEach((card) => {
        card.hidden = card.dataset.storyYear !== selectedYear;
      });
    });
  });

  picker.querySelector('[aria-pressed="true"]')?.click();
});
