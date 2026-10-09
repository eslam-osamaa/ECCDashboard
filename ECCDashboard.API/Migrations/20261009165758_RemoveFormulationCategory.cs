using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECCDashboard.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveFormulationCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Formulations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Formulations",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
