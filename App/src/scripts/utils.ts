export function formatDate(date: Date): string {
    let day: string = ("0" + date.getDate()).slice(-2)
    let month: string = ("0"+(date.getMonth() + 1)).slice(-2)

    return `${date.getFullYear()}-${month}-${day}`;
}