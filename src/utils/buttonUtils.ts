export function getButtonColor(theme?: number): string {
    switch (theme) {
        case 0: return 'success';  // Green
        case 1: return 'primary';  // Blue
        case 2: return 'warning';  // Yellow
        case 3: return 'danger';   // Red
        case 4: return 'tertiary'; // Purple
        case 5: return 'success';  // Dark green
        case 6: return 'primary';  // Dark blue
        case 7: return 'warning';  // Orange
        case 8: return 'danger';   // Dark red
        case 9: return 'tertiary'; // Purple
        default: return 'medium';  // Default gray
    }
}