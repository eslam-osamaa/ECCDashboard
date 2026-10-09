using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECCDashboard.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFormulationType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Formulations",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Formulations");
        }
    }
}
