from invoke import task, Context


@task
def format(ctx: Context) -> None:
    """
    Format code using black
    """
    ctx.run("black .")
