using JobPortal.API.Data;
using JobPortal.API.Services;
using JobPortal.API.Services.ExternalJobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DotNetEnv;


namespace JobPortal.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Load environment variables from .env file
            Env.Load();

            var builder = WebApplication.CreateBuilder(args);

            // Add environment variables to configuration
            builder.Configuration.AddEnvironmentVariables();

            //For Gemini Integration
            builder.Services.AddHttpClient();

            // Register External Job Services
            builder.Services.AddHttpClient<RemotiveJobService>();
            builder.Services.AddHttpClient<ArbeitnowJobService>();
            builder.Services.AddHttpClient<JSearchJobService>();

            // Add CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(',') 
                        ?? new[] { "http://localhost:5173", "http://localhost:5174" };
                    
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Build connection string from environment variables
            var connectionString = $"Server={Environment.GetEnvironmentVariable("DB_SERVER")};" +
                                   $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
                                   $"User={Environment.GetEnvironmentVariable("DB_USER")};" +
                                   $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};";

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
                    )
            );

            // JWT Configuration from environment variables
            var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
            var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
            var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey!)
                    )
                };
            });


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            // Enable Swagger in all environments (remove condition for production access)
            app.UseSwagger();
            app.UseSwaggerUI();

            // Only redirect to HTTPS if not behind a reverse proxy handling SSL
            if (!app.Environment.IsDevelopment())
            {
                // Comment out if using a load balancer/reverse proxy for SSL termination
                // app.UseHttpsRedirection();
            }
            else
            {
                app.UseHttpsRedirection();
            }

            app.UseCors("AllowFrontend");

            app.UseAuthentication();
            app.UseAuthorization();

            // Health check endpoint
            app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

            app.MapControllers();

            app.Run();
        }
    }
}

